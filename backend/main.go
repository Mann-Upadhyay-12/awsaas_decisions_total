package main

import (
	"context"
	"log"
	"math"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type NetworkProfile struct {
	RTTMs          *float64 `json:"rttMs"`
	BandwidthMbps  *float64 `json:"bandwidthMbps"`
	ConnectionType *string  `json:"connectionType"`
	SaveData       bool     `json:"saveData"`
	Class          *string  `json:"networkClass"`
}

type DeviceProfile struct {
	CPUScore     *int     `json:"cpuScore"`
	MemoryGb     *float64 `json:"memoryGb"`
	Cores        *int     `json:"cores"`
	ScreenWidth  *int     `json:"screenWidth"`
	ScreenHeight *int     `json:"screenHeight"`
	DPR          float64  `json:"dpr"`
	Class        *string  `json:"deviceClass"`
}

type HistoryProfile struct {
	AvgFCP       *float64 `json:"avgFCP"`
	AvgTTI       *float64 `json:"avgTTI"`
	AvgLCP       *float64 `json:"avgLCP"`
	SessionCount *int     `json:"sessionCount"`
	LastVisit    *int64   `json:"lastVisit"`
}

type ProfileRequest struct {
	SessionID string         `json:"sessionId" binding:"required"`
	Network   NetworkProfile `json:"network"`
	Device    DeviceProfile  `json:"device"`
	History   HistoryProfile `json:"history"`
}

type StrategyResponse struct {
	Strategy         string   `json:"strategy"`
	PayloadSize      string   `json:"payloadSize"`
	ImageQuality     string   `json:"imageQuality"`
	Features         []string `json:"features"`
	DeferredFeatures []string `json:"deferredFeatures"`
	Confidence       float64  `json:"confidence"`
	NetworkClass     string   `json:"networkClass"`
	DeviceClass      string   `json:"deviceClass"`
	DecisionMs       int64    `json:"decisionMs"`
}

var (
	decisionsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "awsaas_decisions_total",
	}, []string{"strategy", "network_class"})

	decisionLatency = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "awsaas_decision_latency_ms",
		Buckets: []float64{2, 5, 10, 25, 50, 100},
	})
)

var (
	db  *pgxpool.Pool
	ctx = context.Background()
)

func classifyNetwork(p NetworkProfile) string {
	if p.Class != nil { return *p.Class }
	if p.SaveData { return "SLOW" }
	if p.RTTMs != nil {
		rtt := *p.RTTMs
		if rtt < 50 { return "FAST" }
		if rtt < 200 { return "MODERATE" }
		return "SLOW"
	}
	return "MODERATE"
}

func classifyDevice(p DeviceProfile) string {
	if p.Class != nil { return *p.Class }
	score := 0
	if p.CPUScore != nil {
		if *p.CPUScore < 150 { score += 3 } else if *p.CPUScore < 400 { score += 2 } else { score += 1 }
	}
	if p.MemoryGb != nil {
		if *p.MemoryGb >= 8 { score += 3 } else if *p.MemoryGb >= 4 { score += 2 } else { score += 1 }
	} else {
		score += 2
	}
	if p.Cores != nil {
		if *p.Cores >= 8 { score += 2 } else if *p.Cores >= 4 { score += 1 }
	}

	if score >= 6 { return "HIGH" }
	if score >= 4 { return "MEDIUM" }
	return "LOW"
}

func getStrategy(netClass, devClass string, confidence float64) StrategyResponse {
	res := StrategyResponse{
		NetworkClass:     netClass,
		DeviceClass:      devClass,
		Confidence:       confidence,
		Features:         []string{},
		DeferredFeatures: []string{},
	}

	if confidence < 0.3 {
		res.Strategy, res.ImageQuality = "LARGE", "HIGH"
		res.PayloadSize = res.Strategy
		res.Features = []string{"core", "analytics", "chat", "video", "animations"}
		return res
	}

	if netClass == "SLOW" || devClass == "LOW" {
		if netClass == "SLOW" && devClass == "HIGH" {
			res.Strategy, res.ImageQuality = "MEDIUM", "MEDIUM"
			res.Features, res.DeferredFeatures = []string{"core", "analytics"}, []string{"chat", "video"}
		} else {
			res.Strategy, res.ImageQuality = "SMALL", "LOW"
			res.Features, res.DeferredFeatures = []string{"core", "analytics"}, []string{"analytics", "chat", "video", "animations"}
		}
	} else if netClass == "FAST" || devClass == "HIGH" {
		res.Strategy, res.ImageQuality = "LARGE", "HIGH"
		res.Features = []string{"core", "analytics", "chat", "video", "animations"}
	} else {
		res.Strategy, res.ImageQuality = "MEDIUM", "MEDIUM"
		res.Features, res.DeferredFeatures = []string{"core", "analytics", "animations"}, []string{"chat", "video"}
	}

	res.PayloadSize = res.Strategy
	return res
}

func logDecision(req ProfileRequest, res StrategyResponse) {
	if db == nil { return }
	_, err := db.Exec(ctx, `
		INSERT INTO decisions (
			session_id, rtt_ms, bandwidth_mbps, network_type,
			network_class, cpu_score, memory_gb, cores,
			device_class, has_history, strategy, image_quality,
			deferred_features, confidence, decision_ms, timestamp
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
	`,
		req.SessionID, req.Network.RTTMs, req.Network.BandwidthMbps,
		req.Network.ConnectionType, res.NetworkClass, req.Device.CPUScore,
		req.Device.MemoryGb, req.Device.Cores, res.DeviceClass,
		req.History.AvgFCP != nil, res.Strategy, res.ImageQuality,
		res.DeferredFeatures, res.Confidence, res.DecisionMs,
	)
	if err != nil { log.Printf("db error: %v", err) }
}

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" { dsn = "postgresql://postgres:awsaas@localhost:5432/awsaas" }

	var err error
	if db, err = pgxpool.New(ctx, dsn); err != nil {
		log.Printf("db failed: %v", err)
	} else {
		defer db.Close()
	}

	r := gin.New()
	r.Use(gin.Recovery())

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
	r.GET("/api/ping", func(c *gin.Context) { c.Status(204) })
	r.HEAD("/api/ping", func(c *gin.Context) { c.Status(204) })
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	r.POST("/api/profile", func(c *gin.Context) {
		start := time.Now()
		var req ProfileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.AbortWithStatusJSON(400, gin.H{"error": err.Error()})
			return
		}

		netClass := classifyNetwork(req.Network)
		devClass := classifyDevice(req.Device)

		conf := 0.0
		if req.Network.RTTMs != nil { conf += 0.25 }
		if req.Network.BandwidthMbps != nil { conf += 0.15 }
		if req.Device.CPUScore != nil { conf += 0.20 }
		if req.Device.MemoryGb != nil { conf += 0.15 }
		if req.History.AvgFCP != nil { conf += 0.10 }
		conf = math.Min(conf, 1.0)

		res := getStrategy(netClass, devClass, conf)
		res.DecisionMs = time.Since(start).Milliseconds()

		go logDecision(req, res)

		decisionsTotal.WithLabelValues(res.Strategy, res.NetworkClass).Inc()
		decisionLatency.Observe(float64(res.DecisionMs))

		c.JSON(200, res)
	})

	port := os.Getenv("PORT")
	if port == "" { port = "8000" }
	r.Run(":" + port)
}
