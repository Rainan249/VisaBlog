package api

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"visablog/backend/internal/auth"
	"visablog/backend/internal/config"
	"visablog/backend/internal/store"
)

type Server struct {
	cfg   config.Config
	store *store.Store
	auth  *auth.Manager
}

func New(cfg config.Config, st *store.Store, am *auth.Manager) http.Handler {
	s := &Server{cfg: cfg, store: st, auth: am}
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("POST /api/feedback", s.handleCreateFeedback)
	mux.HandleFunc("POST /api/admin/login", s.handleLogin)
	mux.HandleFunc("POST /api/admin/logout", s.handleLogout)

	protected := func(h http.HandlerFunc) http.Handler { return am.Require(h) }
	mux.Handle("GET /api/admin/me", protected(s.handleMe))
	mux.Handle("GET /api/admin/tree", protected(s.handleTree))
	mux.Handle("POST /api/admin/categories", protected(s.handleCreateCategory))
	mux.Handle("PATCH /api/admin/categories", protected(s.handleRenameCategory))
	mux.Handle("DELETE /api/admin/categories", protected(s.handleDeleteCategory))
	mux.Handle("GET /api/admin/notes", protected(s.handleListNotes))
	mux.Handle("GET /api/admin/note", protected(s.handleGetNote))
	mux.Handle("POST /api/admin/notes", protected(s.handleCreateNote))
	mux.Handle("PUT /api/admin/note", protected(s.handleUpdateNote))
	mux.Handle("DELETE /api/admin/note", protected(s.handleDeleteNote))
	mux.Handle("GET /api/admin/images", protected(s.handleListImages))
	mux.Handle("POST /api/admin/images", protected(s.handleUploadImages))
	mux.Handle("DELETE /api/admin/image", protected(s.handleDeleteImage))
	mux.Handle("GET /api/admin/feedback", protected(s.handleListFeedback))
	mux.Handle("DELETE /api/admin/feedback", protected(s.handleDeleteFeedback))

	// 后台缩略图/图片预览；前端 public/uploads 由 Vite 直接服务，这里用于独立部署
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.ImagesDir))))

	return s.withMiddleware(mux)
}

func (s *Server) withMiddleware(next http.Handler) http.Handler {
	return s.recoverer(s.logger(s.cors(next)))
}

func (s *Server) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if s.cfg.AllowedOrigin != "" {
			w.Header().Set("Access-Control-Allow-Origin", s.cfg.AllowedOrigin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		log.Printf("%s %s %d %s", r.Method, r.URL.Path, rec.status, time.Since(start).Round(time.Millisecond))
	})
}

func (s *Server) recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if v := recover(); v != nil {
				log.Printf("[panic] %v", v)
				writeError(w, http.StatusInternalServerError, "服务器内部错误")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 8<<20))
	dec.DisallowUnknownFields()
	return dec.Decode(dst)
}

func statusFor(err error) int {
	switch {
	case errors.Is(err, store.ErrInvalidPath):
		return http.StatusBadRequest
	case errors.Is(err, store.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, store.ErrExists), errors.Is(err, store.ErrNotEmpty):
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}
