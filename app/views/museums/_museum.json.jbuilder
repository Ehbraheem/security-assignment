json.extract! museum, :id, :title, :description, :created_at, :updated_at
json.artifacts museum.things.count
json.visitors museum.users.count
json.url museum_url(museum, format: :json)
json.user_roles museum.user_roles    unless museum.user_roles.empty?