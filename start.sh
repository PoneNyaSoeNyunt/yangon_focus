#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Running migrations..."
php artisan migrate --force --seed

echo "🌐 Starting Apache server..."
apache2-foreground
