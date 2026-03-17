namespace NoctiPrep;

public class Order
{
    public int orderNumber;
    public Purchase[] purchases;
    public float subtotal;
    public float taxTotal;
    public int shippingFee;

    public Order(int orderNumber, Purchase[] purchases, float subtotal = 0, float taxTotal = 0, int shippingFee = 0)
    {
        this.orderNumber = orderNumber;
        this.purchases = purchases;
        this.subtotal = subtotal;
        this.taxTotal = taxTotal;
        this.shippingFee = shippingFee;
    }

    /// <summary>
    /// Calculates the total price for each purchase in the order.
    /// </summary>
    /// <returns>Final total of the order, including sales tax and shipping fee</returns>
    public float calculateTotal()
    {
        // Reset order totals and shipping
        subtotal = 0;
        taxTotal = 0;
        shippingFee = 0;

        foreach (Purchase purchase in purchases)
        {
            subtotal += purchase.quantity * purchase.unitPrice;
        }

        taxTotal = subtotal * 1.06f;

        shippingFee = subtotal > 50 ? 10 : 0;

        return finalTotal;
    }
}