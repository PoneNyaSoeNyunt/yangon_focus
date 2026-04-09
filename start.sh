#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Running migrations..."
php artisan migrate --force

echo "🌱 Seeding database..."
php artisan db:seed --force || echo 'Seeding skipped (data likely already exists)'

echo "🌐 Starting Apache server..."
apache2-foreground
