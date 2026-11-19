package auth

import (
	"context"
	"crypto/subtle"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"visablog/backend/internal/config"
)

const (
	CookieName = "visablog_admin"
	tokenTTL   = 7 * 24 * time.Hour
)

var ErrUnauthorized = errors.New("unauthorized")

type ctxKey string

const userKey ctxKey = "admin-user"

// Manager 负责单用户登录：bcrypt 校验密码 + 签发/校验 JWT。
type Manager struct {
	username string
	hash     []byte
	secret   []byte
	disabled bool
}

func New(cfg config.Config) (*Manager, error) {
	hash := []byte(strings.TrimSpace(cfg.AdminPasswordHash))
	if len(hash) == 0 {
		if cfg.AdminPassword == "" {
			return nil, errors.New("必须设置 ADMIN_PASSWORD 或 ADMIN_PASSWORD_HASH")
		}
		var err error
		hash, err = bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
	}
	return &Manager{
		username: cfg.AdminUsername,
		hash:     hash,
		secret:   []byte(cfg.SessionSecret),
		disabled: cfg.AuthDisabled,
	}, nil
}

// Authenticate 恒定时间比较用户名，再用 bcrypt 校验密码。
func (m *Manager) Authenticate(username, password string) bool {
	if m.disabled {
		return true
	}
	userOK := subtle.ConstantTimeCompare([]byte(username), []byte(m.username)) == 1
	passOK := bcrypt.CompareHashAndPassword(m.hash, []byte(password)) == nil
	return userOK && passOK
}

type claims struct {
	jwt.RegisteredClaims
}

func (m *Manager) Issue(username string) (string, error) {
	now := time.Now()
	c := claims{RegisteredClaims: jwt.RegisteredClaims{
		Issuer:    "visablog",
		Subject:   username,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(tokenTTL)),
	}}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, c).SignedString(m.secret)
}

func (m *Manager) Verify(token string) (string, error) {
	parsed, err := jwt.ParseWithClaims(token, &claims{}, func(t *jwt.Token) (any, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, ErrUnauthorized
		}
		return m.secret, nil
	})
	if err != nil || !parsed.Valid {
		return "", ErrUnauthorized
	}
	c, ok := parsed.Claims.(*claims)
	if !ok || c.Subject == "" {
		return "", ErrUnauthorized
	}
	return c.Subject, nil
}

// Require 校验 Cookie 或 Authorization: Bearer。
func (m *Manager) Require(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if m.disabled {
			ctx := context.WithValue(r.Context(), userKey, "dev")
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		token := ""
		if cookie, err := r.Cookie(CookieName); err == nil {
			token = cookie.Value
		}
		if token == "" {
			if h := r.Header.Get("Authorization"); strings.HasPrefix(h, "Bearer ") {
				token = strings.TrimPrefix(h, "Bearer ")
			}
		}

		user, err := m.Verify(token)
		if err != nil {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"error":"未登录或登录已过期"}`))
			return
		}

		ctx := context.WithValue(r.Context(), userKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserFrom(ctx context.Context) string {
	user, _ := ctx.Value(userKey).(string)
	return user
}
