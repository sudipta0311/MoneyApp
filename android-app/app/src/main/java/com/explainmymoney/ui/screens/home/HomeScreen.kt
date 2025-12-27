package com.explainmymoney.ui.screens.home

import android.Manifest
import android.content.ContentResolver
import android.database.Cursor
import android.net.Uri
import android.provider.Telephony
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.explainmymoney.data.parser.SmsParser
import com.explainmymoney.data.parser.StatementParser
import com.explainmymoney.data.repository.TransactionRepository
import com.explainmymoney.domain.model.Transaction
import com.explainmymoney.ui.components.TransactionCard
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun HomeScreen(
    repository: TransactionRepository,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val transactions by repository.getAllTransactions().collectAsState(initial = emptyList())
    
    var isScanning by remember { mutableStateOf(false) }
    var scanResult by remember { mutableStateOf<String?>(null) }

    val smsPermissionState = rememberPermissionState(Manifest.permission.READ_SMS)
    val smsParser = remember { SmsParser() }
    val statementParser = remember { StatementParser(context) }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            scope.launch {
                isScanning = true
                try {
                    val parsed = withContext(Dispatchers.IO) {
                        statementParser.parseFile(it)
                    }
                    if (parsed.isNotEmpty()) {
                        repository.insertTransactions(parsed)
                        scanResult = "Imported ${parsed.size} transactions from statement"
                    } else {
                        scanResult = "No transactions found in file"
                    }
                } catch (e: Exception) {
                    scanResult = "Error parsing file: ${e.message}"
                }
                isScanning = false
            }
        }
    }

    fun scanSmsMessages() {
        if (!smsPermissionState.status.isGranted) {
            smsPermissionState.launchPermissionRequest()
            return
        }

        scope.launch {
            isScanning = true
            try {
                val parsedTransactions = withContext(Dispatchers.IO) {
                    val smsUri = Telephony.Sms.CONTENT_URI
                    val projection = arrayOf(
                        Telephony.Sms._ID,
                        Telephony.Sms.ADDRESS,
                        Telephony.Sms.BODY,
                        Telephony.Sms.DATE
                    )

                    val cursor: Cursor? = try {
                        context.contentResolver.query(
                            smsUri,
                            projection,
                            null,
                            null,
                            "${Telephony.Sms.DATE} DESC LIMIT 500"
                        )
                    } catch (e: SecurityException) {
                        null
                    }

                    val transactions = mutableListOf<Transaction>()
                    cursor?.use {
                        val addressIndex = it.getColumnIndex(Telephony.Sms.ADDRESS)
                        val bodyIndex = it.getColumnIndex(Telephony.Sms.BODY)
                        val dateIndex = it.getColumnIndex(Telephony.Sms.DATE)

                        if (addressIndex < 0 || bodyIndex < 0 || dateIndex < 0) {
                            return@use
                        }

                        while (it.moveToNext()) {
                            val address = it.getString(addressIndex) ?: continue
                            val body = it.getString(bodyIndex) ?: continue
                            val date = it.getLong(dateIndex)

                            smsParser.parseTransactionSms(address, body, date)?.let { tx ->
                                transactions.add(tx)
                            }
                        }
                    }
                    transactions
                }

                if (parsedTransactions.isNotEmpty()) {
                    repository.insertTransactions(parsedTransactions)
                    scanResult = "Found ${parsedTransactions.size} transaction SMS messages"
                } else {
                    scanResult = "No transaction messages found. Make sure you have bank SMS messages."
                }
            } catch (e: Exception) {
                scanResult = "Error scanning SMS: ${e.message ?: "Unknown error"}"
            }
            isScanning = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Explain My Money",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Understand your transactions",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { /* Notifications */ }) {
                        Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { scanSmsMessages() },
                    enabled = !isScanning,
                    modifier = Modifier.weight(1f)
                ) {
                    if (isScanning) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Icon(Icons.Default.Sms, contentDescription = null, modifier = Modifier.size(18.dp))
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Scan SMS")
                }

                OutlinedButton(
                    onClick = { filePickerLauncher.launch("*/*") },
                    enabled = !isScanning,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Import File")
                }
            }

            scanResult?.let { result ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.secondaryContainer
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = result,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        IconButton(
                            onClick = { scanResult = null },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Dismiss",
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "RECENT TRANSACTIONS",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${transactions.size} total",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (transactions.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.Inbox,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "No transactions yet",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Scan your SMS or import a bank statement",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(transactions, key = { it.id }) { transaction ->
                        TransactionCard(
                            transaction = transaction,
                            onDelete = {
                                scope.launch {
                                    repository.deleteTransaction(transaction.id)
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}
