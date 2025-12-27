package com.explainmymoney

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.explainmymoney.data.database.AppDatabase
import com.explainmymoney.ui.navigation.MainNavigation
import com.explainmymoney.ui.theme.ExplainMyMoneyTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        val app = application as ExplainMyMoneyApp
        val database = app.database
        
        setContent {
            ExplainMyMoneyTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    MainNavigation(database = database)
                }
            }
        }
    }
}
