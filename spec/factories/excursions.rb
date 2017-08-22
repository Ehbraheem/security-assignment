FactoryGirl.define do
  factory :excursion do
    
    association :museum
    association :user
    
  end
end
