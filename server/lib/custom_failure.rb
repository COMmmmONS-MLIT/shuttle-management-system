# frozen_string_literal: true

class CustomFailure < Devise::FailureApp
  def respond
    self.status = 401
    self.content_type = 'application/json'
    self.response_body = if sign_in_request?
                           { success: false, error: 'メールアドレスまたはパスワードが違います' }.to_json
                         else
                           { success: false, error: 'Unauthenticated' }.to_json
                         end
  end

  private

  def sign_in_request?
    request.env['REQUEST_METHOD'] == 'POST' &&
      ['/users/sign_in', '/admin/sign_in'].include?(request.env['REQUEST_PATH'])
  end
end
