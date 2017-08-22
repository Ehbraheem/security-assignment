class AddDescriptionToMuseum < ActiveRecord::Migration
  def change
  	add_column :museums, :description, :string
  end
end
