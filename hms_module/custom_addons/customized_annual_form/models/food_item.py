from odoo import models, fields

class FoodItem(models.Model):
    _name = 'food.item'
    _description = 'Dishes'

    name = fields.Char(string="Dishes", required=True)
    dish_code = fields.Integer(string="Dish Code")
    food_group = fields.Selection(
        [
            ('animal_meat', 'Animal Meat'), 
            ('cereals_millets', 'Cereals and Millets'),
            ('edible_oils_and_millets', 'Edible Oils and Fats'),   
            ('egg_and_egg_products', 'Egg and Egg Products'), 
            ('fresher_water_fish', 'Fresh Water Fish and Shellfish'),    
            ('fruits', 'Fruits'),  
            ('grain_legumes', 'Grain Legumes'),       
            ('green_leafy_vegetables', 'Green Leafy Vegetables'),    
            ('marine_fish', 'Marine Fish'),   
            ('marine_shellfish', 'Marine Shellfish'),   
            ('milk_and_milk_products', 'Milk and Milk Products'),   
            ('miscellaneous_foods', 'Miscellaneous Foods'),   
            ('mushrooms', 'Mushrooms'),   
            ('nuts_and_oil_seeds', 'Nuts and Oil Seeds'),   
            ('other_vegetables', 'Other Vegetables'),  
            ('poultry', 'Poultry'),            
            ('roots_and_tubers', 'Roots and Tubers'),            
            ('sugars', 'Sugars'),              
        ],         
        string="Food Category"
    )
