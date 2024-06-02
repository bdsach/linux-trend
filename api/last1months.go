package handlers

import (
	"encoding/json"
	"log"
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
	// Open the JSON file
	jsonFile, err := os.Open("data/last1months.json")
	if err != nil {
		// Handle error and return 500 status code
		http.Error(w, "Unable to open JSON file", http.StatusInternalServerError)
		log.Println(err)
		return
	}
	defer jsonFile.Close()

	// Decode the JSON file into a Go data structure
	var data interface{}
	err = json.NewDecoder(jsonFile).Decode(&data)
	if err != nil {
		// Handle error and return 500 status code
		http.Error(w, "Unable to decode JSON file", http.StatusInternalServerError)
		log.Println(err)
		return
	}

	// Set the content type to application/json
	w.Header().Set("Content-Type", "application/json")

	// Encode the data structure into JSON and write it to the response
	err = json.NewEncoder(w).Encode(data)
	if err != nil {
		// Handle error and return 500 status code
		http.Error(w, "Unable to encode JSON response", http.StatusInternalServerError)
		log.Println(err)
		return
	}
}
