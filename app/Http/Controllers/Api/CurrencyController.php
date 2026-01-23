<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CurrencyService;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    protected $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    /**
     * Get exchange rates
     */
    public function getRates()
    {
        $currencies = ['NGN', 'USD', 'EUR', 'GBP'];
        $rates = [];

        foreach ($currencies as $currency) {
            $rates[$currency] = $this->currencyService->getExchangeRate('USD', $currency);
        }

        return response()->json([
            'base' => 'USD',
            'rates' => $rates,
        ]);
    }

    /**
     * Convert amount between currencies
     */
    public function convert(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
        ]);

        $convertedAmount = $this->currencyService->convert(
            $request->amount,
            $request->from,
            $request->to
        );

        return response()->json([
            'amount' => $request->amount,
            'from' => $request->from,
            'to' => $request->to,
            'converted_amount' => $convertedAmount,
            'rate' => $this->currencyService->getExchangeRate($request->from, $request->to),
        ]);
    }
}
