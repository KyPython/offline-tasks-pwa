class Task < ApplicationRecord
  has_many_attached :files

  enum status: {
    pending: 0,
    in_progress: 1,
    completed: 2
  }

  validates :title, presence: true
  validates :status, presence: true
end

