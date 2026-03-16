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
            string newLine = purchase[0] + purchase[1] + purchase[2] + purchase[3] + purchase[4];
            csv.AppendNewLine(newLine);
        }
        File.AppendAllText("./purchases.csv", csv.ToString());
        Console.WriteLine($"Stored {purchaseData.Count} purchase(s).");
    }

    /// <summary>
    /// Collects purchase data from prompts.
    /// </summary>
    public void Collect()
    {
        // Prepare a new list for all the purchases.
        var purchasesData = new List<string[]>();

        // Get customer purchase amount. If invalid input, default to 0 (exits).
        Console.Write("How many customer purchases will be entered? ");
        var input = Console.ReadLine();
        if (!int.TryParse(input, out int purchases) || purchases <= 0)
        {
            Console.WriteLine("Ensure the number of customer purchases is an integer greater than 0.");
            purchases = 0;
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

            // Ensure both item quantity and unit price are both numbers.
            Console.Write("Item quantity? ");
            string quantityInput = Console.ReadLine();
            if (!int.TryParse(quantityInput, out int quantity) || quantity < 0)
            {
                Console.WriteLine("Invalid quantity entered. Setting quantity to 0.");
                quantity = 0;
            }

            Console.Write("Unit price? ");
            string unitPriceInput = Console.ReadLine();
            if (!float.TryParse(unitPriceInput, out float unitPrice) || unitPrice < 0f)
            {
                Console.WriteLine("Invalid unit price entered. Setting price to 0.00.");
                unitPrice = 0f;
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