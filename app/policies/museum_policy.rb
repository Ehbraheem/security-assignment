class MuseumPolicy < ApplicationPolicy

  def index?
    @user
  end

  def show?
    @user
  end

  def update?
    organizer?
  end

  def create?
    @user
  end
  
  def destroy?
    organizer_or_admin?
  end

  def museum_things?
    @user
  end

  def museum_thing?
    @user
  end

  class Scope < Scope
    def user_roles
      joins_clause=["left join Roles r on r.mname='Museum'",
                    "r.mid=Museums.id",
                    "r.user_id #{user_criteria}"].join(" and ")
      scope.select("Museums.*, r.role_name")
           .joins(joins_clause)
    end

    def resolve
      user_roles
    end
  end

end
