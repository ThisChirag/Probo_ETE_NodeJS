

import { GlobalData} from "../db";
import { buy,getProbabilityOfYes,sell} from "../utils/orderHelper";
import { message, publishMessage } from "../services/redis";

interface OrderData {
  price: number;
  userId: string;
  quantity: number;
  stockSymbol: string;
  stockType: "yes" | "no";
}
interface OrderCancelData { 
  orderId:string
}
const {orderBook,ordersList,inrBalances} = GlobalData
export const handleBuy = async (data:OrderData,eventId:string)=>{
    const { userId, stockSymbol, quantity, price:buyerPrice, stockType } = data;
    const price = buyerPrice/100;
    if(!orderBook[stockSymbol]){
      return publishMessage(message(400, "Invalid paramas", null), eventId);
    }
    let availableQuantity = quantity
      for( let i=1;i<price;i++){
        if(availableQuantity>0 && orderBook[stockSymbol][stockType][i]){
          const totalAvailable = orderBook[stockSymbol][stockType][i].total
          const min = Math.min(totalAvailable,availableQuantity)
          stockType==="yes" ? buy(userId,stockSymbol,min,i,"yes") : buy(userId,stockSymbol,min,i,"no")
          availableQuantity-=min
        }
      }
    const response  = stockType ==="yes" ? buy(userId,stockSymbol,availableQuantity,price,"yes") : buy(userId,stockSymbol,availableQuantity,price,"no");
    if(!response) return publishMessage(message(400, "Invalid paramas", null), eventId);
    if(response.error)
      return publishMessage(message(400, response.error, null), eventId);
    const parsedOrderBook = JSON.stringify( orderBook[stockSymbol])
    if(!GlobalData.traders[stockSymbol]) GlobalData.traders[stockSymbol]= new Set()
    GlobalData.traders[stockSymbol].add(userId)

    publishMessage(message(200,"",{stockSymbol,orderBook:parsedOrderBook}),"MESSAGE")    
    publishMessage(message(200, `Buy successful`, null),eventId);
}

export const handleSell = async (data:OrderData,eventId:string)=>{
  const { userId, stockSymbol, quantity, price:sellerPrice, stockType } = data;
  const price = sellerPrice/100;
  if(!orderBook[stockSymbol]){
    return publishMessage(message(400, "Invalid paramas", null), eventId);
  }
  const response = stockType == "no"?sell(userId, stockSymbol, quantity, price,"no"):sell(userId, stockSymbol, quantity, price,"yes")
  if(!response) return publishMessage(message(400, "Invalid paramas", null), eventId);
  if(response.error) return publishMessage(message(400, response.error, null), eventId);
  const parsedOrderBook = JSON.stringify( orderBook[stockSymbol])
  publishMessage(message(200,"",{stockSymbol,orderBook:parsedOrderBook}),"MESSAGE")    
  publishMessage(message(200, `Sold`, null),eventId);
}

export const cancelOrder = async (data:OrderCancelData,eventId:string)=>{
    const {orderId} = data
    console.log(orderId)
    const order = ordersList.filter((e)=>e.id===orderId)
    if(order.length==0){
      publishMessage(message(404,"Order not found",null),eventId)
    }
    const {quantity,stockSymbol,stockType,price,userId,totalPrice} = order[0]
    orderBook[stockSymbol][stockType as "yes"|"no"][price].total-=quantity
    orderBook[stockSymbol][stockType as "yes"|"no"][price].orders[userId].quantity-=quantity
    if(orderBook[stockSymbol][stockType as "yes"|"no"][price].orders[userId].type==="sell"){
      GlobalData.stockBalances[userId][stockSymbol][stockType as "yes"|"no"].locked -= quantity
      GlobalData.stockBalances[userId][stockSymbol][stockType as "yes"|"no"].quantity += quantity
    }
    else{
      inrBalances[userId].locked-=totalPrice
      inrBalances[userId].balance+=totalPrice
    }
    const parsedOrderBook = JSON.stringify( orderBook[stockSymbol])
    publishMessage(message(200,"",{stockSymbol,orderBook:parsedOrderBook}),"MESSAGE")    
    publishMessage(message(200, `Order cancelled`, null),eventId);
}


export const getOrders = async (data: string, eventId: string) => {
  try {
    const orders = GlobalData.ordersList
      .filter((order) => order.userId === data)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const uniqueOrders = Array.from(new Map(orders.map((order) => [order.id, order])).values());
    publishMessage(
      message(200, "Orders retrieved successfully", { orders: uniqueOrders }),
      eventId
    );
  } catch (error) {
    console.error("Error retrieving orders:", error);
    publishMessage(
      message(500, "Error", null), 
      eventId
    );
  }
};


export const exit = async (data:{stockSymbol:string,userId:string,price:number,stockType:"yes"|"no",quantity:number},eventId:string)=>{
  const { userId, stockSymbol,price,stockType,quantity } = data;
  const stockBalances = GlobalData.stockBalances[userId][stockSymbol]
  if(!stockBalances){
    return publishMessage(message(400, "No stocks", null), eventId);
  }
  if(stockBalances[stockType].quantity<quantity)
    return publishMessage(message(400, "Insuffient stocks", null), eventId);
  const sellerPrice = price/100;
   const response = stockType === "yes" ?  sell(userId, stockSymbol, quantity, sellerPrice,"yes"):sell(userId,stockSymbol,quantity,sellerPrice,"no")
  if(response.error)
    return publishMessage(message(400, response.error, null), eventId);
  if(GlobalData.stockBalances[userId] )
  {
    const yes =  GlobalData.stockBalances[userId][stockSymbol].yes 
    const no =  GlobalData.stockBalances[userId][stockSymbol].no 
    if(yes?.locked===0 && yes?.quantity===0 && no?.locked===0 && no?.quantity===0){
       delete GlobalData.stockBalances[userId][stockSymbol]
    }

  }
  const parsedOrderBook = JSON.stringify( orderBook[stockSymbol])
  publishMessage(message(200,"",{stockSymbol,orderBook:parsedOrderBook}),"MESSAGE")    
  publishMessage(message(200, `Sold`, null),eventId);
}
export const getPrice = async (stockSymbol:string,eventId:string)=>{
  const yes = getProbabilityOfYes(stockSymbol) * 10;
  const no = 10 - yes
  publishMessage(message(200,"",{yes:Number(yes).toFixed(0),no:Number(no).toFixed(0)}),eventId)
}