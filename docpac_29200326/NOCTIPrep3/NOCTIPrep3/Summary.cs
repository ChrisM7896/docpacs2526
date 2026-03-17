namespace NoctiPrep;

internal class Summary
{
    // List of orders, containing each purchase with that order number.
    private readonly List<Order> orders = new();
    private readonly string[] lines = File.ReadAllLines("./purchases.csv");
    /// <summary>
    /// Collects all purchases of the same order into the orders list.
    /// </summary>
    public void collectOrders()
    {
        foreach (string line in lines)
        {
            // Create array for that line
            string[] purchaseData = line.Split(',');
            // If incomplete, skip
            if (purchaseData.Length < 6)
            {
                continue;
            }

            // Create a new purchase for the purchase data from line.
            var purchase = new Purchase
            (
                purchaseData[0],
                purchaseData[1],
                purchaseData[2],
                int.Parse(purchaseData[3]),
                float.Parse(purchaseData[4]),
                int.Parse(purchaseData[5])
            );

            // Search for order in the orders list. If it exists, overwrite existingOrder.
            Order? existingOrder = null;
            foreach (Order order in orders)
            {
                if (order.orderNumber == purchase.orderNumber)
                {
                    existingOrder = order;
                    break;
                }
            }

            // Add purchase to previous order or add new order to the orders list.
            if (existingOrder is null)
            {
                orders.Add(new Order(purchase.orderNumber, new[] { purchase }));
            }
            else
            {
                var updatedPurchases = new Purchase[existingOrder.purchases.Length + 1];
                existingOrder.purchases.CopyTo(updatedPurchases, 0);
                updatedPurchases[^1] = purchase;
                existingOrder.purchases = updatedPurchases;
            }
        }
    }

    /// <summary>
    /// Prints the summary of all orders to the console. 
    /// </summary>
    public void printOrdersSummary()
    {
        // Ensure the orders list is up to date
        collectOrders();

        foreach (Order order in orders)
        {

        }
    }
}