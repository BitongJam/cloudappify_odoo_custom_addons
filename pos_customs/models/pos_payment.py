from odoo import _, api, fields, models



class PosPayment(models.Model):
    _inherit = 'pos.payment'

    # def group_by_payment_method(self):
    #     try:
    #         # Debug print
    #         print("Method group_by_payment_method called")
            
    #         # Your existing SQL logic here
    #         query = """
    #             SELECT SUM(pp.amount), ppm.id, ppm.name
    #             FROM pos_payment pp
    #             JOIN pos_payment_method ppm ON ppm.id = pp.payment_method_id
    #             GROUP BY ppm.name, ppm.id
    #         """
            
    #         self.env.cr.execute(query)
    #         results = self.env.cr.fetchall()

    #         # Check if results are empty
    #         if not results:
    #             print("No results found")

    #         # Prepare and return the data
    #         grouped_data = [{'method_id': result[1], 'total_amount': result[0], 'method_name': result[2]} for result in results]
    #         return grouped_data

    #     except Exception as e:
    #         # Print exception for debugging
    #         print("Error in group_by_payment_method:", str(e))
    #         return {'error': str(e)}

    @api.model
    def group_by_payment_method(self):
            try:
                # Debug print
                print("Method group_by_payment_method called")
                
                # Your existing SQL logic here
                query = """
                    select sum(pp.amount),ppm.id ,ppm.name,rcy.symbol from pos_payment pp
                    join pos_payment_method ppm on ppm.id = pp.payment_method_id
                    join res_company rc on rc.id = pp.company_id
                    join res_currency rcy on rcy.id = rc.currency_id
                    group by ppm.name,ppm.id,rcy.symbol
                """
                
                self.env.cr.execute(query)
                results = self.env.cr.fetchall()

                # Check if results are empty
                if not results:
                    print("No results found")

                # Prepare and return the data
                grouped_data = [{'method_id': result[1], 'total_amount': result[0], 'method_name': result[2],'currency_symbol':result[3]} for result in results]
                return grouped_data

            except Exception as e:
                # Print exception for debugging
                print("Error in group_by_payment_method:", str(e))
                return {'error': str(e)}

