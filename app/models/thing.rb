class Thing < ActiveRecord::Base
  include Protectable
  validates :name, :presence=>true

  has_many :thing_images, inverse_of: :thing, dependent: :destroy
  belongs_to :museum

  scope :not_linked, ->(image) { where.not(:id=>ThingImage.select(:thing_id)
                                                          .where(:image=>image)) }
  scope :museum_artifact, ->(museum_id, thing_id) { 
  										where(:id=>thing_id, :museum_id=>museum_id)}

  # def self.museum_artifact museum_id, thing_id 
  # 	where(:id=>thing_id, :museum_id=>museum_id)
  # end
end
