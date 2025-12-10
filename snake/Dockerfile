FROM nginx:latest

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Copy the HTML template
COPY snake.html /usr/share/nginx/html/index.html


# Copy and set permissions for startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh


EXPOSE 80

CMD ["/docker-entrypoint.sh"]
