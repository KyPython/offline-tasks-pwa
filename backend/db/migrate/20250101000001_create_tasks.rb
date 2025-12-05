class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.integer :status, null: false, default: 0
      t.datetime :due_date

      t.timestamps
    end

    add_index :tasks, :status
    add_index :tasks, :due_date
  end
end

