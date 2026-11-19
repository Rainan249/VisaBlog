package api

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"visablog/backend/internal/store"
)

// 简单的内存限流：同一 IP 10 秒内只能提交一次
var feedbackLimiter = struct {
	sync.Mutex
	last map[string]time.Time
}{last: map[string]time.Time{}}

func clientIP(r *http.Request) string {
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return host
	}
	return r.RemoteAddr
}

func (s *Server) handleCreateFeedback(w http.ResponseWriter, r *http.Request) {
	ip := clientIP(r)
	feedbackLimiter.Lock()
	if last, ok := feedbackLimiter.last[ip]; ok && time.Since(last) < 10*time.Second {
		feedbackLimiter.Unlock()
		writeError(w, http.StatusTooManyRequests, "提交太频繁，请稍后再试")
		return
	}
	feedbackLimiter.last[ip] = time.Now()
	feedbackLimiter.Unlock()

	var req store.FeedbackInput
	if err := decodeJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "请求格式错误")
		return
	}
	item, err := s.store.AddFeedback(req)
	if err != nil {
		status := http.StatusBadRequest
		if strings.Contains(err.Error(), "服务器") {
			status = http.StatusInternalServerError
		}
		writeError(w, status, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": item.ID})
}

func (s *Server) handleListFeedback(w http.ResponseWriter, _ *http.Request) {
	items, err := s.store.ListFeedback()
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"feedback": items})
}

func (s *Server) handleDeleteFeedback(w http.ResponseWriter, r *http.Request) {
	if err := s.store.DeleteFeedback(r.URL.Query().Get("id")); err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
