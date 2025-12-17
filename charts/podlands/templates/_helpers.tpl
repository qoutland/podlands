{{- define "podlands.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "podlands.fullName" -}}
{{.Release.Name}}-{{ .Chart.Name }}
{{- end }}
