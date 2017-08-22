class MuseumsController < ApplicationController
  include ActionController::Helpers
  helper ThingsHelper

  wrap_parameters :museum, include: ["museum_id", "artifact_id", "title"]
  before_action :set_museum, only: [:show, :update, :destroy, :museum_things]
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  after_action :verify_authorized

  def index
    authorize Museum
    @museums = Museum.all

    # render json: @museums
  end

  def show
    authorize @museum
  end

  def create
    authorize Museum
    @museum = Museum.new(museum_params)

    if @museum.save
      render json: @museum, status: :created, location: @museum
    else
      render json: @museum.errors, status: :unprocessable_entity
    end
  end

  def update
    authorize @museum
    @museum = Museum.find(params[:id])

    if @museum.update(museum_params)
      head :no_content
    else
      render json: @museum.errors, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @museum
    @museum.destroy

    head :no_content
  end

  def museum_things
    authorize @museum
    @things = @museum.things
    render 'things/index'
  end

  def add_thing

  end

  def museum_thing
    authorize Museum
    ids = params.values_at(:museum_id, :artifact_id)
    @things = Thing.museum_artifact(*ids)
    render 'things/index'
  end

  private

    def set_museum
      id = params[:id] || params[:museum_id]
      @museum = Museum.find(id)
    end

    def museum_params
      params.require(:museum).permit(:title)
    end

    def museum_artifacts_param
      params.require(:museum).tap {|p|
        p.require(:museum_id)      if !params[:museum_id]
        p.require(:artifact_id)    if !params[:artifact_id]
      }.permit(:museum_id, :artifact_id)
    end
end