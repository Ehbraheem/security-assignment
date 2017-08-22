class CreateExcursions < ActiveRecord::Migration
  def change
    create_table :excursions do |t|
      t.references :user, foreign_key: true, index: true,  null:false
      t.references :museum, index: true, foreign_key: true, null:false

      t.timestamps null: false
    end
  end
end
