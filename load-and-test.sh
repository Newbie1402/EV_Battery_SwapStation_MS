#!/bin/bash

# Load only valid env lines: không phải dòng trống và không phải comment
set -a
source <(grep -E '^[A-Z0-9_]+=' .env.example)
set +a

# Run Maven test
mvn test
