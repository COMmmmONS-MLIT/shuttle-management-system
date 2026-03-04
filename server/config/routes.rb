# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength
Rails.application.routes.draw do
  # users リソースを devise_for の前に定義して、POST /users が users#create にマッピングされるようにする
  resources :users, only: %i[create]

  devise_for :users,
             controllers: {
               sessions: 'users/sessions'
             }

  resources :auth

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  # get 'up' => 'rails/health#show', as: :rails_health_check

  # ヘルスチェック用ルート
  resource :healthcheck, only: %i[show]

  # 初回セットアップ用（認証不要）
  get 'install', to: 'install#index'
  post 'install', to: 'install#create'

  # customers namespace を先に定義
  namespace :customers do
    get 'customer', to: 'customer#show'
    post 'customer/create_request_notification'
    resources :mergedatas, only: %i[index]
  end

  resources :customers, except: %i[new edit destroy] do
    get :office_latlng, on: :collection
    get :point_options, on: :collection
    get :customer_bookmarks_options, on: :member
  end

  resources :car_restrictions, only: %i[index]

  resources :cars, only: %i[index show create update] do
    collection do
      get :locations
    end
    get :point_options, on: :collection
  end

  resources :car_patterns, only: %i[index]

  resources :customer_ngs, only: %i[index create update destroy] do
    collection do
      get :customer_options
    end
  end

  resources :points, only: %i[index show create update]

  resources :visitings, only: %i[index show] do
    collection do
      get :car_index
      get :visitings_customer_index
      get :point_options
      get :requested_soge
      post :new_data
      post :replicate
      post :replicate_with_overwrite
      post :share_to_office
    end
    member do
      put :update_time
      get :distance_route
      get :can_driving_staff
      put :update_staffs
      get :route
      put :update_point
      delete :remove_all_customers
    end
  end

  resources :visitings_customers, only: %i[index create update destroy] do
    collection do
      post :bulk_create
      get :point_options
      get :accept_office_options
      post :soge_type_options
      post :request_visitings_customer
      get :search_customers
    end
    member do
      delete :remove_from_visiting
      put :update_requested_customer
      get :suggested_visiting_customers
    end
  end

  resources :staffs, only: %i[index show create update]

  resources :post_codes, only: %i[show]

  resources :data_uploads, only: %i[create]

  resources :dashboard, only: [] do
    collection do
      get :schedule
      get :statistics
    end
  end

  resources :requested_customers, only: %i[index] do
    collection do
      post :cancel
      post :update_allowed
      post :reject_approve
    end
    member do
      post :cancel_request_after_approval
      post :approve_cancellation
    end
  end

  resources :notifications, only: %i[index] do
    member do
      put :read
    end
  end

  # ----------------tourism----------------
  namespace :tourism do
    resources :visitings, only: %i[index show] do
      collection do
        get :car_index
        get :visitings_customer_index
        get :point_options
        get :requested_soge
        post :new_data
        post :replicate
        post :replicate_with_overwrite
        post :share_to_office
      end
      member do
        put :update_time
        get :distance_route
        get :can_driving_staff
        put :update_staffs
        get :route
        put :update_point
        delete :remove_all_customers
      end
    end

    resources :visitings_customers, only: %i[index create update destroy] do
      collection do
        get :point_options
        get :accept_office_options
        post :request_visitings_customer
      end
    end
    resources :dashboard, only: [] do
      collection do
        get :statistics
      end
    end
  end

  # ----------------education----------------
  namespace :education do
    resources :visitings, only: %i[index show] do
      collection do
        get :car_index
        get :visitings_customer_index
        get :point_options
        get :requested_soge
        post :new_data
        post :replicate
        post :replicate_with_overwrite
        post :share_to_office
      end
      member do
        put :update_time
        get :distance_route
        get :can_driving_staff
        put :update_staffs
        get :route
        put :update_point
        delete :remove_all_customers
      end
    end

    resources :visitings_customers, only: %i[index create update destroy] do
      collection do
        get :point_options
        get :accept_office_options
        post :bulk_create
        post :request_visitings_customer
      end
    end
    resources :dashboard, only: [] do
      collection do
        get :statistics
      end
    end
  end

  # ----------------admin----------------

  devise_for :admins, path: 'admin',
                      controllers: {
                        sessions: 'admin/sessions'
                      }

  namespace :admin do
    resources :admins, only: %i[index create]
    resources :offices, only: %i[index show create update] do
      member do
        put :set_tenant_cd
      end
      resources :users, only: %i[index create update] do
        member do
          match 'password', action: :update_password, via: %i[put patch]
        end
      end
    end
    resources :auth, only: [:index]
  end
end
# rubocop:enable Metrics/BlockLength
