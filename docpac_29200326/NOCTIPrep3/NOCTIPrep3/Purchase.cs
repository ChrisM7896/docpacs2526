namespace NoctiPrep;

public class Purchase
{
    public string firstName;
    public string lastName;
    public string itemName;
    public int quantity;
    public float unitPrice;

    public Purchase(string firstName, string lastName, string itemName, int quantity, float unitPrice, int orderNumber)
    {
        this.firstName = firstName;
        this.lastName = lastName;
        this.itemName = itemName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.orderNumber = orderNumber;
    }
}