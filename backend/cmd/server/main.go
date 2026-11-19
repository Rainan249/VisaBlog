package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"visablog/backend/internal/api"
	"visablog/backend/internal/auth"
	"visablog/backend/internal/config"
	"visablog/backend/internal/store"
)

func main() {
	cfg := config.Load()

	authManager, err := auth.New(cfg)
	if err != nil {
		log.Fatalf("[auth] %v", err)
	}
	st, err := store.New(cfg.NotesDir, cfg.ImagesDir, cfg.FeedbackDir)
	if err != nil {
		log.Fatalf("[store] %v", err)
	}

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           api.New(cfg, st, authManager),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       60 * time.Second,
		WriteTimeout:      120 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	log.Printf("VisaBlog backend listening on %s", cfg.Addr)
	log.Printf("notes  -> %s", cfg.NotesDir)
	log.Printf("images -> %s", cfg.ImagesDir)
	log.Printf("feedback -> %s", cfg.FeedbackDir)
	if cfg.AuthDisabled {
		log.Println("[WARN] AUTH_DISABLED=true：后台接口无需登录，仅用于本地测试！")
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("[http] %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("[http] 关闭失败: %v", err)
	}
	log.Println("server stopped")
}
