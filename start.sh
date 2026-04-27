#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "� Setting storage permissions..."
chmod -R 775 /var/www/html/storage

echo "🔗 Creating storage symlink..."
php artisan storage:link --force

echo "🚀 Running migrations..."
php artisan migrate --force

echo "🌱 Seeding database..."
php artisan db:seed --force || echo 'Seeding skipped (data likely already exists)'

echo "🗺️  Clearing route cache..."
php artisan route:clear

echo "🌐 Starting Apache server..."
apache2-foreground
