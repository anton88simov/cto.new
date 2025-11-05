//+------------------------------------------------------------------+
//|                                       XAUUSD_PendingLimit_EA.mq4 |
//|                      Версия с Limit ордерами (для откатов)       |
//|                           Торговля отложенными ордерами с TP/SL  |
//+------------------------------------------------------------------+
#property copyright "MT4 EA Limit Orders"
#property link      ""
#property version   "1.00"
#property strict

// Входные параметры
input double LotSize = 0.01;                  // Размер лота
input int TakeProfit = 100;                   // Take Profit в пунктах
input int StopLoss = 50;                      // Stop Loss в пунктах
input int PendingDistance = 30;               // Дистанция для отложенного ордера (в пунктах)
input int ReorderTime = 300;                  // Время до перевыставления ордера (в секундах)
input int MagicNumber = 123457;               // Магический номер
input string TradeSymbol = "XAUUSD";          // Торговый символ
input bool UseBuyOrders = true;               // Использовать ордера на покупку
input bool UseSellOrders = true;              // Использовать ордера на продажу
input int MaxSpread = 50;                     // Максимальный спред в пунктах
input double RiskPercent = 0;                 // Процент риска от депозита (0 = фиксированный лот)

// Глобальные переменные
datetime LastBuyOrderTime = 0;
datetime LastSellOrderTime = 0;
int BuyOrderTicket = 0;
int SellOrderTicket = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   if(Period() != PERIOD_M5)
   {
      Alert("Советник предназначен для работы на таймфрейме M5!");
      return(INIT_FAILED);
   }
   
   if(Symbol() != TradeSymbol)
   {
      Alert("Советник предназначен для торговли на паре ", TradeSymbol);
      return(INIT_FAILED);
   }
   
   Print("Limit Orders EA инициализирован для ", TradeSymbol, " на M5");
   Print("Торговля откатами с использованием BuyLimit и SellLimit");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("Limit Orders EA остановлен. Причина: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   double spread = (Ask - Bid) / Point;
   if(spread > MaxSpread)
   {
      return;
   }
   
   if(UseBuyOrders)
   {
      ManageBuyPendingOrder();
   }
   
   if(UseSellOrders)
   {
      ManageSellPendingOrder();
   }
}

//+------------------------------------------------------------------+
//| Управление отложенным ордером BuyLimit                           |
//+------------------------------------------------------------------+
void ManageBuyPendingOrder()
{
   bool orderExists = false;
   
   if(BuyOrderTicket > 0)
   {
      if(OrderSelect(BuyOrderTicket, SELECT_BY_TICKET))
      {
         if(OrderType() == OP_BUYLIMIT && OrderCloseTime() == 0)
         {
            orderExists = true;
            
            if(TimeCurrent() - LastBuyOrderTime > ReorderTime)
            {
               if(OrderDelete(BuyOrderTicket))
               {
                  Print("Удален старый BuyLimit ордер #", BuyOrderTicket);
                  BuyOrderTicket = 0;
                  orderExists = false;
               }
            }
         }
         else
         {
            BuyOrderTicket = 0;
            orderExists = false;
         }
      }
      else
      {
         BuyOrderTicket = 0;
         orderExists = false;
      }
   }
   
   if(!orderExists && !HasOpenBuyPosition())
   {
      PlaceBuyLimitOrder();
   }
}

//+------------------------------------------------------------------+
//| Управление отложенным ордером SellLimit                          |
//+------------------------------------------------------------------+
void ManageSellPendingOrder()
{
   bool orderExists = false;
   
   if(SellOrderTicket > 0)
   {
      if(OrderSelect(SellOrderTicket, SELECT_BY_TICKET))
      {
         if(OrderType() == OP_SELLLIMIT && OrderCloseTime() == 0)
         {
            orderExists = true;
            
            if(TimeCurrent() - LastSellOrderTime > ReorderTime)
            {
               if(OrderDelete(SellOrderTicket))
               {
                  Print("Удален старый SellLimit ордер #", SellOrderTicket);
                  SellOrderTicket = 0;
                  orderExists = false;
               }
            }
         }
         else
         {
            SellOrderTicket = 0;
            orderExists = false;
         }
      }
      else
      {
         SellOrderTicket = 0;
         orderExists = false;
      }
   }
   
   if(!orderExists && !HasOpenSellPosition())
   {
      PlaceSellLimitOrder();
   }
}

//+------------------------------------------------------------------+
//| Проверка наличия открытой позиции на покупку                     |
//+------------------------------------------------------------------+
bool HasOpenBuyPosition()
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == TradeSymbol && OrderMagicNumber() == MagicNumber)
         {
            if(OrderType() == OP_BUY)
            {
               return true;
            }
         }
      }
   }
   return false;
}

//+------------------------------------------------------------------+
//| Проверка наличия открытой позиции на продажу                     |
//+------------------------------------------------------------------+
bool HasOpenSellPosition()
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == TradeSymbol && OrderMagicNumber() == MagicNumber)
         {
            if(OrderType() == OP_SELL)
            {
               return true;
            }
         }
      }
   }
   return false;
}

//+------------------------------------------------------------------+
//| Размещение отложенного ордера BuyLimit (ниже текущей цены)       |
//+------------------------------------------------------------------+
void PlaceBuyLimitOrder()
{
   double lotSize = CalculateLotSize(StopLoss);
   
   // BuyLimit размещается НИЖЕ текущей цены (ожидаем откат вниз)
   double low = iLow(TradeSymbol, PERIOD_M5, 1);
   double entryPrice = NormalizeDouble(low - PendingDistance * Point, Digits);
   
   // Убеждаемся, что цена ниже текущей Ask
   if(entryPrice >= Ask)
   {
      entryPrice = NormalizeDouble(Ask - PendingDistance * Point, Digits);
   }
   
   double sl = NormalizeDouble(entryPrice - StopLoss * Point, Digits);
   double tp = NormalizeDouble(entryPrice + TakeProfit * Point, Digits);
   
   // Проверка минимальной дистанции
   double minDistance = MarketInfo(TradeSymbol, MODE_STOPLEVEL) * Point;
   if(Ask - entryPrice < minDistance)
   {
      entryPrice = NormalizeDouble(Ask - minDistance - 5 * Point, Digits);
      sl = NormalizeDouble(entryPrice - StopLoss * Point, Digits);
      tp = NormalizeDouble(entryPrice + TakeProfit * Point, Digits);
   }
   
   int ticket = OrderSend(
      TradeSymbol,
      OP_BUYLIMIT,
      lotSize,
      entryPrice,
      3,
      sl,
      tp,
      "BuyLimit Order",
      MagicNumber,
      0,
      clrGreen
   );
   
   if(ticket > 0)
   {
      BuyOrderTicket = ticket;
      LastBuyOrderTime = TimeCurrent();
      Print("BuyLimit ордер размещен #", ticket, " по цене ", entryPrice, " SL:", sl, " TP:", tp);
   }
   else
   {
      Print("Ошибка размещения BuyLimit ордера: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| Размещение отложенного ордера SellLimit (выше текущей цены)      |
//+------------------------------------------------------------------+
void PlaceSellLimitOrder()
{
   double lotSize = CalculateLotSize(StopLoss);
   
   // SellLimit размещается ВЫШЕ текущей цены (ожидаем откат вверх)
   double high = iHigh(TradeSymbol, PERIOD_M5, 1);
   double entryPrice = NormalizeDouble(high + PendingDistance * Point, Digits);
   
   // Убеждаемся, что цена выше текущей Bid
   if(entryPrice <= Bid)
   {
      entryPrice = NormalizeDouble(Bid + PendingDistance * Point, Digits);
   }
   
   double sl = NormalizeDouble(entryPrice + StopLoss * Point, Digits);
   double tp = NormalizeDouble(entryPrice - TakeProfit * Point, Digits);
   
   // Проверка минимальной дистанции
   double minDistance = MarketInfo(TradeSymbol, MODE_STOPLEVEL) * Point;
   if(entryPrice - Bid < minDistance)
   {
      entryPrice = NormalizeDouble(Bid + minDistance + 5 * Point, Digits);
      sl = NormalizeDouble(entryPrice + StopLoss * Point, Digits);
      tp = NormalizeDouble(entryPrice - TakeProfit * Point, Digits);
   }
   
   int ticket = OrderSend(
      TradeSymbol,
      OP_SELLLIMIT,
      lotSize,
      entryPrice,
      3,
      sl,
      tp,
      "SellLimit Order",
      MagicNumber,
      0,
      clrRed
   );
   
   if(ticket > 0)
   {
      SellOrderTicket = ticket;
      LastSellOrderTime = TimeCurrent();
      Print("SellLimit ордер размещен #", ticket, " по цене ", entryPrice, " SL:", sl, " TP:", tp);
   }
   else
   {
      Print("Ошибка размещения SellLimit ордера: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| Расчет размера лота                                              |
//+------------------------------------------------------------------+
double CalculateLotSize(int stopLossPips)
{
   double lot = LotSize;
   
   if(RiskPercent > 0)
   {
      double balance = AccountBalance();
      double riskAmount = balance * RiskPercent / 100.0;
      double tickValue = MarketInfo(TradeSymbol, MODE_TICKVALUE);
      double tickSize = MarketInfo(TradeSymbol, MODE_TICKSIZE);
      
      if(tickValue > 0 && stopLossPips > 0)
      {
         double stopLossValue = stopLossPips * Point;
         lot = NormalizeDouble(riskAmount / (stopLossValue / tickSize * tickValue), 2);
      }
   }
   
   double minLot = MarketInfo(TradeSymbol, MODE_MINLOT);
   double maxLot = MarketInfo(TradeSymbol, MODE_MAXLOT);
   double lotStep = MarketInfo(TradeSymbol, MODE_LOTSTEP);
   
   if(lot < minLot) lot = minLot;
   if(lot > maxLot) lot = maxLot;
   
   lot = NormalizeDouble(lot / lotStep, 0) * lotStep;
   
   return lot;
}
//+------------------------------------------------------------------+
