package handlers

import (
	"encoding/json"
	"net/http"
)

func Json(w http.ResponseWriter, r *http.Request) {
	responseData := map[string]string{
		"message": "Hello, JSON!",
	}

	jsonData, err := json.Marshal(responseData)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
