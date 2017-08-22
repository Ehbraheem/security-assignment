class Excursion < ActiveRecord::Base
  belongs_to :user
  belongs_to :museum
end
