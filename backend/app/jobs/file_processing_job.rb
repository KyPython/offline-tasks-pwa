# Optional: Background job for processing file uploads
# Example: image resizing, virus scanning, etc.
# To use: FileProcessingJob.perform_later(attachment_id)
class FileProcessingJob < ApplicationJob
  queue_as :default

  def perform(attachment_id)
    # Stub for future file processing logic
    # Example: process image, generate thumbnails, etc.
    attachment = ActiveStorage::Attachment.find_by(id: attachment_id)
    return unless attachment

    # Add your processing logic here
    Rails.logger.info "Processing file: #{attachment.filename}"
  end
end

