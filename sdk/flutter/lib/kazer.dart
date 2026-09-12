import 'dart:convert';
import 'package:http/http.dart' as http;

class Kazer {
  final String baseUrl;
  final String? apiKey;
  Kazer({this.apiKey, this.baseUrl = 'http://localhost:3000'});

  Future<Map<String, dynamic>> _request(String path, {Map<String, dynamic>? body}) async {
    final headers = {'content-type': 'application/json', if (apiKey != null) 'authorization': 'Bearer $apiKey'};
    final response = await (body == null
        ? http.get(Uri.parse('$baseUrl$path'), headers: headers)
        : http.post(Uri.parse('$baseUrl$path'), headers: headers, body: jsonEncode(body)));
    if (response.statusCode >= 400) throw Exception('Kazer API ${response.statusCode}: ${response.body}');
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> chat(String prompt) => _request('/v1/chat', body: {'prompt': prompt});
  Future<Map<String, dynamic>> capabilities() => _request('/v1/capabilities');
  Future<Map<String, dynamic>> registry() => _request('/v1/registry');
  Future<Map<String, dynamic>> skills() => _request('/v1/skills');
}
