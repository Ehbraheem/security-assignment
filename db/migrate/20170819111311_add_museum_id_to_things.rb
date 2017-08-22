class AddMuseumIdToThings < ActiveRecord::Migration
  def change
  	add_reference :things, :museum, index:true
  	add_foreign_key :things, :museums
  end
end
