module Api
  module V1
    class TasksController < ApplicationController
      include Rails.application.routes.url_helpers
      
      before_action :set_task, only: [:show, :update, :destroy]
      
      # Set default URL options for url helpers
      def default_url_options
        { host: request.host, port: request.port }
      end

      # GET /api/v1/tasks
      def index
        @tasks = Task.order(created_at: :desc)
        render json: @tasks.map { |task| task_json(task) }
      end

      # GET /api/v1/tasks/:id
      def show
        render json: task_json(@task)
      end

      # POST /api/v1/tasks
      def create
        @task = Task.new(task_params)

        if @task.save
          render json: task_json(@task), status: :created
        else
          render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/tasks/:id
      def update
        if @task.update(task_params)
          render json: task_json(@task)
        else
          render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/tasks/:id
      def destroy
        @task.destroy
        head :no_content
      end

      # POST /api/v1/tasks/:id/files
      def attach_file
        @task = Task.find(params[:id])
        
        if params[:file].present?
          @task.files.attach(params[:file])
          render json: { message: "File attached successfully", file_id: @task.files.last.id }
        else
          render json: { error: "No file provided" }, status: :bad_request
        end
      end

      # GET /api/v1/tasks/:id/files
      def list_files
        @task = Task.find(params[:id])
        files = @task.files.map do |file|
          {
            id: file.id,
            filename: file.filename.to_s,
            content_type: file.content_type,
            byte_size: file.byte_size,
            url: rails_blob_url(file, only_path: false),
            created_at: file.created_at
          }
        end
        render json: { files: files }
      end

      # DELETE /api/v1/tasks/:id/files/:file_id
      def delete_file
        @task = Task.find(params[:id])
        file = @task.files.find(params[:file_id])
        file.purge
        head :no_content
      end

      private

      def set_task
        @task = Task.find(params[:id])
      end

      def task_params
        params.require(:task).permit(:title, :description, :status, :due_date)
      end

      def task_json(task)
        {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.due_date,
          files_count: task.files.count,
          created_at: task.created_at,
          updated_at: task.updated_at
        }
      end
    end
  end
end

