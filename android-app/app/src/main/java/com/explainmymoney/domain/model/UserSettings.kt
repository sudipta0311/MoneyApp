package com.explainmymoney.domain.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_settings")
data class UserSettings(
    @PrimaryKey
    val id: Int = 1,
    val isLoggedIn: Boolean = false,
    val displayName: String? = null,
    val email: String? = null,
    val profileImageUrl: String? = null,
    val countryCode: String = "IN",
    val countryName: String = "India",
    val currencyCode: String = "INR",
    val currencySymbol: String = "₹"
)

data class Country(
    val code: String,
    val name: String,
    val currencyCode: String,
    val currencySymbol: String
)

val SUPPORTED_COUNTRIES = listOf(
    Country("IN", "India", "INR", "₹"),
    Country("US", "United States", "USD", "$"),
    Country("GB", "United Kingdom", "GBP", "£"),
    Country("EU", "European Union", "EUR", "€"),
    Country("JP", "Japan", "JPY", "¥"),
    Country("AU", "Australia", "AUD", "A$"),
    Country("CA", "Canada", "CAD", "C$"),
    Country("AE", "UAE", "AED", "د.إ"),
    Country("SG", "Singapore", "SGD", "S$"),
    Country("MY", "Malaysia", "MYR", "RM"),
    Country("NZ", "New Zealand", "NZD", "NZ$"),
    Country("HK", "Hong Kong", "HKD", "HK$"),
    Country("CH", "Switzerland", "CHF", "CHF"),
    Country("SA", "Saudi Arabia", "SAR", "﷼"),
    Country("ZA", "South Africa", "ZAR", "R")
)

fun getCountryByCode(code: String): Country {
    return SUPPORTED_COUNTRIES.find { it.code == code } ?: SUPPORTED_COUNTRIES[0]
}
