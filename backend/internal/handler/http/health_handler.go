package http

import (
	"net/http"

	"github.com/netparamad/template-nextjs-go/backend/internal/service"
)

type HealthHandler struct {
	service service.HealthService
}

func NewHealthHandler(service service.HealthService) HealthHandler {
	return HealthHandler{service: service}
}

func (h HealthHandler) Get(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.service.Status())
}
