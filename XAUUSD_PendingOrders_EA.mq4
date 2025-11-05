//+------------------------------------------------------------------+
//|                                      XAUUSD_PendingOrders_EA.mq4 |
//|                                   Expert Advisor для XAUUSD M5   |
//|                           Торговля отложенными ордерами с TP/SL  |
//+------------------------------------------------------------------+
#property copyright "MT4 EA"
#property link      ""
#property version   "1.00"
#property strict

// Входные параметры
input double LotSize = 0.01;                  // Размер лота
input int TakeProfit = 100;                   // Take Profit в пунктах
input int StopLoss = 50;                      // Stop Loss в пунктах
input int PendingDistance = 30;               // Дистанция для отложенного ордера (в пунктах)
input int ReorderTime = 300;                  // Время до перевыставления ордера (в секундах)
input int MagicNumber = 123456;               // Магический номер
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
   // Проверка таймфрейма
   if(Period() != PERIOD_M5)
   {
      Alert("Советник предназначен для работы на таймфрейме M5!");
      return(INIT_FAILED);
   }
   
   // Проверка символа
   if(Symbol() != TradeSymbol)
   {
      Alert("Советник предназначен для торговли на паре ", TradeSymbol);
      return(INIT_FAILED);
   }
   
   Print("EA инициализирован успешно для ", TradeSymbol, " на M5");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("EA остановлен. Причина: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Проверка спреда
   double spread = (Ask - Bid) / Point;
   if(spread > MaxSpread)
   {
      Print("Спред слишком большой: ", spread, " пунктов. Торговля приостановлена.");
      return;
   }
   
   // Управление ордерами на покупку
   if(UseBuyOrders)
   {
      ManageBuyPendingOrder();
   }
   
   // Управление ордерами на продажу
   if(UseSellOrders)
   {
      ManageSellPendingOrder();
   }
}

//+------------------------------------------------------------------+
//| Управление отложенным ордером на покупку                         |
//+------------------------------------------------------------------+
void ManageBuyPendingOrder()
{
   // Проверяем, есть ли активный отложенный ордер
   bool orderExists = false;
   
   if(BuyOrderTicket > 0)
   {
      if(OrderSelect(BuyOrderTicket, SELECT_BY_TICKET))
      {
         if(OrderType() == OP_BUYSTOP && OrderCloseTime() == 0)
         {
            orderExists = true;
            
            // Проверяем, нужно ли перевыставить ордер
            if(TimeCurrent() - LastBuyOrderTime > ReorderTime)
            {
               // Удаляем старый ордер
               if(OrderDelete(BuyOrderTicket))
               {
                  Print("Удален старый BuyStop ордер #", BuyOrderTicket);
                  BuyOrderTicket = 0;
                  orderExists = false;
               }
            }
         }
         else
         {
            // Ордер уже сработал или закрыт
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
   
   // Если нет активного отложенного ордера, создаем новый
   if(!orderExists && !HasOpenBuyPosition())
   {
      PlaceBuyStopOrder();
   }
}

//+------------------------------------------------------------------+
//| Управление отложенным ордером на продажу                         |
//+------------------------------------------------------------------+
void ManageSellPendingOrder()
{
   // Проверяем, есть ли активный отложенный ордер
   bool orderExists = false;
   
   if(SellOrderTicket > 0)
   {
      if(OrderSelect(SellOrderTicket, SELECT_BY_TICKET))
      {
         if(OrderType() == OP_SELLSTOP && OrderCloseTime() == 0)
         {
            orderExists = true;
            
            // Проверяем, нужно ли перевыставить ордер
            if(TimeCurrent() - LastSellOrderTime > ReorderTime)
            {
               // Удаляем старый ордер
               if(OrderDelete(SellOrderTicket))
               {
                  Print("Удален старый SellStop ордер #", SellOrderTicket);
                  SellOrderTicket = 0;
                  orderExists = false;
               }
            }
         }
         else
         {
            // Ордер уже сработал или закрыт
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
   
   // Если нет активного отложенного ордера, создаем новый
   if(!orderExists && !HasOpenSellPosition())
   {
      PlaceSellStopOrder();
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
//| Размещение отложенного ордера BuyStop                            |
//+------------------------------------------------------------------+
void PlaceBuyStopOrder()
{
   double lotSize = CalculateLotSize(StopLoss);
   
   // Рассчитываем уровни на основе текущей рыночной ситуации
   double high = iHigh(TradeSymbol, PERIOD_M5, 1);  // Максимум предыдущей свечи
   double entryPrice = NormalizeDouble(high + PendingDistance * Point, Digits);
   
   // Убеждаемся, что цена выше текущей Ask
   if(entryPrice <= Ask)
   {
      entryPrice = NormalizeDouble(Ask + PendingDistance * Point, Digits);
   }
   
   double sl = NormalizeDouble(entryPrice - StopLoss * Point, Digits);
   double tp = NormalizeDouble(entryPrice + TakeProfit * Point, Digits);
   
   // Проверка минимальной дистанции для отложенных ордеров
   double minDistance = MarketInfo(TradeSymbol, MODE_STOPLEVEL) * Point;
   if(entryPrice - Ask < minDistance)
   {
      entryPrice = NormalizeDouble(Ask + minDistance + 5 * Point, Digits);
      sl = NormalizeDouble(entryPrice - StopLoss * Point, Digits);
      tp = NormalizeDouble(entryPrice + TakeProfit * Point, Digits);
   }
   
   int ticket = OrderSend(
      TradeSymbol,
      OP_BUYSTOP,
      lotSize,
      entryPrice,
      3,
      sl,
      tp,
      "BuyStop Order",
      MagicNumber,
      0,
      clrGreen
   );
   
   if(ticket > 0)
   {
      BuyOrderTicket = ticket;
      LastBuyOrderTime = TimeCurrent();
      Print("BuyStop ордер размещен #", ticket, " по цене ", entryPrice, " SL:", sl, " TP:", tp);
   }
   else
   {
      Print("Ошибка размещения BuyStop ордера: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| Размещение отложенного ордера SellStop                           |
//+------------------------------------------------------------------+
void PlaceSellStopOrder()
{
   double lotSize = CalculateLotSize(StopLoss);
   
   // Рассчитываем уровни на основе текущей рыночной ситуации
   double low = iLow(TradeSymbol, PERIOD_M5, 1);  // Минимум предыдущей свечи
   double entryPrice = NormalizeDouble(low - PendingDistance * Point, Digits);
   
   // Убеждаемся, что цена ниже текущей Bid
   if(entryPrice >= Bid)
   {
      entryPrice = NormalizeDouble(Bid - PendingDistance * Point, Digits);
   }
   
   double sl = NormalizeDouble(entryPrice + StopLoss * Point, Digits);
   double tp = NormalizeDouble(entryPrice - TakeProfit * Point, Digits);
   
   // Проверка минимальной дистанции для отложенных ордеров
   double minDistance = MarketInfo(TradeSymbol, MODE_STOPLEVEL) * Point;
   if(Bid - entryPrice < minDistance)
   {
      entryPrice = NormalizeDouble(Bid - minDistance - 5 * Point, Digits);
      sl = NormalizeDouble(entryPrice + StopLoss * Point, Digits);
      tp = NormalizeDouble(entryPrice - TakeProfit * Point, Digits);
   }
   
   int ticket = OrderSend(
      TradeSymbol,
      OP_SELLSTOP,
      lotSize,
      entryPrice,
      3,
      sl,
      tp,
      "SellStop Order",
      MagicNumber,
      0,
      clrRed
   );
   
   if(ticket > 0)
   {
      SellOrderTicket = ticket;
      LastSellOrderTime = TimeCurrent();
      Print("SellStop ордер размещен #", ticket, " по цене ", entryPrice, " SL:", sl, " TP:", tp);
   }
   else
   {
      Print("Ошибка размещения SellStop ордера: ", GetLastError());
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
   
   // Проверка минимального и максимального размера лота
   double minLot = MarketInfo(TradeSymbol, MODE_MINLOT);
   double maxLot = MarketInfo(TradeSymbol, MODE_MAXLOT);
   double lotStep = MarketInfo(TradeSymbol, MODE_LOTSTEP);
   
   if(lot < minLot) lot = minLot;
   if(lot > maxLot) lot = maxLot;
   
   lot = NormalizeDouble(lot / lotStep, 0) * lotStep;
   
   return lot;
}
//+------------------------------------------------------------------+
