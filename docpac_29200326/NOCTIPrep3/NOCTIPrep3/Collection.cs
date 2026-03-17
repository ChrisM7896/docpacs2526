using System.Text;

namespace NoctiPrep;

/// <summary>
/// Handles collecting and storing information about customer purchases provided by a user. 
/// </summary>
internal class Collection
{
    var csv = new StringBuilder();

    /// <summary>
    /// Appends all data collected from user to a CSV file (purchases.csv).
    /// </summary>
    private void Store(List<string[]> purchaseData)
    {
        foreach (string[] purchase in purchaseData)
        {
            string newLine = string.Join(",", purchase);
            csv.AppendNewLine(newLine);
        }
        File.WriteAllText("./purchases.csv", csv.ToString());
        Console.WriteLine($"Stored {purchaseData.Count} purchase(s).");
    }

    /// <summary>
    /// Collects purchase data from prompts.
    /// </summary>
    public void Collect()
    {
        // Prepare a new list for all the purchases.
        var purchasesData = new List<string[]>();

        // Get customer purchase amount. Keep prompting until valid.
        int purchases = -1;
        while (purchases <= 0)
        {
            Console.Write("How many customer purchases will be entered? ");
            var input = Console.ReadLine();
            if (!int.TryParse(input, out purchases) || purchases <= 0)
            {
                Console.WriteLine("Ensure the number of customer purchases is an integer greater than 0.");
                purchases = -1;
            }
        }

        // For each purchase, collect necessary information.
        for (int i = 0; i < purchases; i++)
        {
            Console.Write("Customer first name? ");
            string firstName = Console.ReadLine() ?? string.Empty;
            Console.Write("Customer last name? ");
            string lastName = Console.ReadLine() ?? string.Empty;
            Console.Write("Item name? ");
            string itemName = Console.ReadLine() ?? string.Empty;

            // Ensure item quantity is a valid number.
            int quantity = -1;
            while (quantity < 0)
            {
                Console.Write("Item quantity? ");
                string quantityInput = Console.ReadLine();
                if (!int.TryParse(quantityInput, out quantity) || quantity < 0)
                {
                    Console.WriteLine("Invalid quantity entered. Please enter a non-negative number.");
                    quantity = -1;
                }
            }

            float unitPrice = -1f;
            while (unitPrice < 0f)
            {
                Console.Write("Unit price? ");
                string unitPriceInput = Console.ReadLine();
                if (!float.TryParse(unitPriceInput, out unitPrice) || unitPrice < 0f)
                {
                    Console.WriteLine("Invalid unit price entered. Please enter a non-negative number.");
                    unitPrice = -1f;
                }
            }

            int orderNumber = -1;
            while (orderNumber < 0)
            {
                Console.Write("Order number? ");
                string orderNumberInput = Console.ReadLine();
                if (!int.TryParse(orderNumberInput, out orderNumber) || orderNumber < 0)
                {
                    Console.WriteLine("Invalid order number entered. Please enter a non-negative number.");
                    orderNumber = -1;
                }
            }

            // Add purchase to list.
            purchasesData.Add(new[] {
                firstName,
                lastName,
                itemName,
                quantity.ToString(),
                unitPrice.ToString("F2")
            });
        }

        // If no purchases, don't bother storing.
        if (purchasesData.Count > 0)
        {
            Store(purchasesData);
        }
    }
}