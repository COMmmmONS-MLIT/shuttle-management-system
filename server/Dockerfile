FROM ruby:3.3.0

# ENV
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8
ENV BUNDLER_VERSION 2.3.3

# Locale
RUN apt-get update -qq && apt-get install -y locales \
  && echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
  && locale-gen en_US.UTF-8

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
  diffutils \
  default-mysql-client \
  default-libmysqlclient-dev \
  nodejs \
  npm \
  && rm -rf /var/lib/apt/lists/*

# Setup app directory
ENV APP_DIR=/app
WORKDIR $APP_DIR

# Copy Gemfile and Gemfile.lock
COPY Gemfile $APP_DIR/Gemfile
COPY Gemfile.lock $APP_DIR/Gemfile.lock

# Set Bundler related ENV
ENV GEM_HOME /usr/local/bundle
ENV BUNDLE_PATH="$GEM_HOME"
ENV BUNDLE_SILENCE_ROOT_WARNING=1
ENV BUNDLE_APP_CONFIG="$GEM_HOME"

# Install bundler
RUN gem install bundler --version $BUNDLER_VERSION \
  && bundle config build.nokogiri --use-system-libraries \
  && bundle install

# Copy Rails code
COPY . $APP_DIR

RUN mkdir -p tmp/pids
