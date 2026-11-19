package api

import (
	"net/http"
	"time"

	"visablog/backend/internal/auth"
)

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := decodeJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "请求格式错误")
		return
	}
	if !s.auth.Authenticate(req.Username, req.Password) {
		// 简单延缓暴力破解
		time.Sleep(300 * time.Millisecond)
		writeError(w, http.StatusUnauthorized, "用户名或密码错误")
		return
	}
	token, err := s.auth.Issue(req.Username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "登录失败")
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     auth.CookieName,
		Value:    token,
		Path:     "/api/admin",
		HttpOnly: true,
		Secure:   s.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
	})
	writeJSON(w, http.StatusOK, map[string]string{"username": req.Username})
}

func (s *Server) handleLogout(w http.ResponseWriter, _ *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     auth.CookieName,
		Value:    "",
		Path:     "/api/admin",
		HttpOnly: true,
		MaxAge:   -1,
		SameSite: http.SameSiteLaxMode,
	})
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"username":      auth.UserFrom(r.Context()),
		"auth_disabled": s.cfg.AuthDisabled,
	})
}
