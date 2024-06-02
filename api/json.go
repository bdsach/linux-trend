package handlers

import (
	"fmt"
	"net/http"
)

func Json(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "<h1>Hello from Go!</h1>")
}
