package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"time"
)

type DistroItem struct {
	No        int    `json:"no"`
	Name      string `json:"name"`
	Rank      int    `json:"rank"`
	Trend     string `json:"trend"`
	URL       string `json:"url"`
	Logo      string `json:"logo"`
	Yesterday int    `json:"yesterday"`
}

type ResponseData struct {
	CreateAt time.Time    `json:"createAt"`
	Data     []DistroItem `json:"last1months"`
}

func Json(w http.ResponseWriter, r *http.Request) {

	// read json file root project /data/last1months.json
	jsonFile, err := os.Open("data/last1months.json")

	if err != nil {
		println(err)
	}

	defer jsonFile.Close()

	data := ResponseData{
		CreateAt: time.Now(),
		Data:     []DistroItem{},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
