package config

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// Config 全部来自环境变量（支持 backend/.env）。
type Config struct {
	Addr              string
	AdminUsername     string
	AdminPassword     string
	AdminPasswordHash string
	SessionSecret     string
	NotesDir          string
	ImagesDir         string
	FeedbackDir       string
	AuthDisabled      bool
	CookieSecure      bool
	AllowedOrigin     string
}

func Load() Config {
	loadDotEnv(".env")
	loadDotEnv(filepath.Join("backend", ".env"))

	cfg := Config{
		Addr:              env("ADDR", ":8080"),
		AdminUsername:     env("ADMIN_USERNAME", "admin"),
		AdminPassword:     os.Getenv("ADMIN_PASSWORD"),
		AdminPasswordHash: os.Getenv("ADMIN_PASSWORD_HASH"),
		SessionSecret:     os.Getenv("SESSION_SECRET"),
		NotesDir:          env("NOTES_DIR", pickDir("../frontend/posts", "frontend/posts")),
		ImagesDir:         env("IMAGES_DIR", pickDir("../frontend/public/uploads", "frontend/public/uploads")),
		FeedbackDir:       env("FEEDBACK_DIR", "data/feedback"),
		AuthDisabled:      envBool("AUTH_DISABLED", false),
		CookieSecure:      envBool("COOKIE_SECURE", false),
		AllowedOrigin:     os.Getenv("ALLOWED_ORIGIN"),
	}

	if cfg.SessionSecret == "" {
		cfg.SessionSecret = randomHex(32)
		log.Println("[config] SESSION_SECRET 未设置，已生成临时密钥（重启后登录态失效）")
	}

	cfg.NotesDir = absPath(cfg.NotesDir)
	cfg.ImagesDir = absPath(cfg.ImagesDir)
	cfg.FeedbackDir = absPath(cfg.FeedbackDir)
	return cfg
}

func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func envBool(key string, fallback bool) bool {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return b
}

func absPath(p string) string {
	abs, err := filepath.Abs(p)
	if err != nil {
		return p
	}
	return abs
}

// pickDir 兼容从 backend/ 或仓库根目录启动。
func pickDir(fromBackend, fromRoot string) string {
	if _, err := os.Stat(fromBackend); err == nil {
		return fromBackend
	}
	if _, err := os.Stat(fromRoot); err == nil {
		return fromRoot
	}
	return fromBackend
}

func randomHex(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		log.Fatalf("[config] 生成随机密钥失败: %v", err)
	}
	return hex.EncodeToString(b)
}

// loadDotEnv 读取简单的 KEY=VALUE 文件；已存在的环境变量优先。
func loadDotEnv(name string) {
	f, err := os.Open(name)
	if err != nil {
		return
	}
	defer f.Close()

	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if _, exists := os.LookupEnv(key); !exists {
			_ = os.Setenv(key, value)
		}
	}
}
