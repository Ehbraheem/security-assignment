class Museum < ActiveRecord::Base
	include Protectable

	has_many :excursions, inverse_of: :museum
	has_many :users, through: :excursions
	has_many :things, inverse_of: :museum, dependent: :nullify

	validates :title, :presence=> true, :uniqueness=>true, :allow_nil=>true
end
