package com.explainmymoney.ui.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.explainmymoney.data.database.AppDatabase
import com.explainmymoney.data.repository.TransactionRepository
import com.explainmymoney.ui.screens.analytics.AnalyticsScreen
import com.explainmymoney.ui.screens.chat.ChatScreen
import com.explainmymoney.ui.screens.home.HomeScreen
import com.explainmymoney.ui.screens.investments.InvestmentsScreen
import com.explainmymoney.ui.screens.permissions.PermissionsScreen

sealed class Screen(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    object Home : Screen("home", "Home", Icons.Filled.Home, Icons.Outlined.Home)
    object Analytics : Screen("analytics", "Analytics", Icons.Filled.BarChart, Icons.Outlined.BarChart)
    object Investments : Screen("investments", "Invest", Icons.Filled.TrendingUp, Icons.Outlined.TrendingUp)
    object Chat : Screen("chat", "Chat", Icons.Filled.Chat, Icons.Outlined.Chat)
    object Permissions : Screen("permissions", "Settings", Icons.Filled.Settings, Icons.Outlined.Settings)
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Analytics,
    Screen.Investments,
    Screen.Chat,
    Screen.Permissions
)

@Composable
fun MainNavigation(
    database: AppDatabase,
    modifier: Modifier = Modifier
) {
    val navController = rememberNavController()
    val repository = remember { TransactionRepository(database.transactionDao()) }

    Scaffold(
        bottomBar = {
            BottomNavigationBar(navController = navController)
        },
        modifier = modifier
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(repository = repository)
            }
            composable(Screen.Analytics.route) {
                AnalyticsScreen(repository = repository)
            }
            composable(Screen.Investments.route) {
                InvestmentsScreen(repository = repository)
            }
            composable(Screen.Chat.route) {
                ChatScreen(repository = repository)
            }
            composable(Screen.Permissions.route) {
                PermissionsScreen()
            }
        }
    }
}

@Composable
fun BottomNavigationBar(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = NavigationBarDefaults.Elevation
    ) {
        bottomNavItems.forEach { screen ->
            val selected = currentRoute == screen.route

            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = if (selected) screen.selectedIcon else screen.unselectedIcon,
                        contentDescription = screen.title
                    )
                },
                label = {
                    Text(
                        text = screen.title,
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                selected = selected,
                onClick = {
                    if (currentRoute != screen.route) {
                        navController.navigate(screen.route) {
                            popUpTo(navController.graph.startDestinationId) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    indicatorColor = MaterialTheme.colorScheme.secondaryContainer
                )
            )
        }
    }
}
