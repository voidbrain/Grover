<?php
/**********

	adjacency.php v1.0
	www.someotherdeveloper.com
	
	Class for handling an Adjacency List Model.
	
	REQUIRED TABLE COLUMNS: id(int), parent(int)
	
	
	
	--Add a node--
	$adj = new adjacency;
	$adj->table = 'test';
	$adj->values['firstname'] = 'James';
	$adj->values['lastname'] = 'Smith';
	$adj->values['parent'] = 15;
	$adj->add();
	
	
	
	--Update a node--
	$adj = new adjacency;
	$adj->table = 'test';
	$adj->values['firstname'] = 'Mary';
	$adj->values['parent'] = 32;
	$adj->where['id'] = 61;
	$adj->update();
	
	
	
	--Remove a node--
	$adj = new adjacency;
	$adj->table = 'test';
	$adj->where['parent'] = 43;
	$adj->remove();
	
	
	
	--Build a tree--
	$adj = new adjacency;
	$adj->table = 'test';
	$adj->values[] = 'firstname';
	$adj->values[] = 'lastname';
	$adj->order = 'lastname';
	$adj->fetch();
	$adj->organize();
	
	foreach($adj->tree as $item)
	{
		echo str_repeat(' ', $item['depth'] * 3) . $item['firstname'] . ' ' . $item['lastname'] . "\n";
	}
	
**********/



	class adjacency
	{
		/** Construct **/
		function __construct()
		{
			//Pre-define all class variables
			$this->reset();
		}
		
		
		
		/** Add **/
		function add()
		{
			//Set parent if not set
			if(!isset($this->values['parent'])) $this->values['parent'] = 0;
			
			//Loop through array and add "value" statements to query
			foreach($this->values as $key => $value)
			{
				$query_columns .= $key . ', ';
				$query_values .= (gettype($value) == 'string' ? ('"' . $value . '"') : $value) . ', ';
			}
			
			//Merge query
			$query = 'INSERT INTO ' . $this->table . '(' . substr($query_columns, 0, -2) . ') VALUES(' . substr($query_values, 0, -2) . ')' . ($this->extra ? (' ' . $this->extra) : '');
			echo $query;
			//Run query and save result
			$result = mysql_query($query) or die(mysql_error());
			
			//Fetch insert ID
			$this->insert_id = mysql_insert_id();
			
			//Return result
			return $result;
		}
		
		
		
		/** Update **/
		function update()
		{
			//Loop through array and add "value" statements to query
			foreach($this->values as $key => $value)
			{
				$query_values .= $key . ' = ' . (gettype($value) == 'string' ? ('"' . $value . '"') : $value) . ', ';
			}
			
			//Loop through array and add "where" statements to query
			foreach($this->where as $key => $value)
			{
				$query_where .= $key . ' = ' . (gettype($value) == 'string' ? ('"' . $value . '"') : $value) . ' ' . $this->separator . ' ';
			}
			
			//Merge query
			$query = 'UPDATE ' . $this->table . ' SET ' . substr($query_values, 0, -2) . ($this->where ? (' WHERE ' . substr($query_where, 0, (0 - strlen($this->separator) - 2))) : '') . ($this->order ? (' ORDER BY ' . $this->order) : '') . ($this->extra ? (' ' . $this->extra) : '');
			
			//Run query and return result
			return mysql_query($query) or die(mysql_error());
		}
		
		
		
		/** Remove **/
		function remove()
		{
			//Loop through array and add "where" statements to query
			foreach($this->where as $key => $value)
			{
				$query_where .= $key . ' = ' . (gettype($value) == 'string' ? ('"' . $value . '"') : $value) . ' ' . $this->separator . ' ';
			}
			
			//Merge query
			$query = 'REMOVE FROM ' . $this->table . ($this->where ? (' WHERE ' . substr($query_where, 0, (0 - strlen($this->separator) - 2))) : '') . ($this->extra ? (' ' . $this->extra) : '');
			
			//Run query and return result
			return mysql_query($query) or die(mysql_error());
		}
		
		
		
		/** Fetch **/
		function fetch()
		{
			//Columns "id" and "parent" are obligatory - add these to the values just in case and remove dublicates
			$this->values[] = 'id';
			$this->values[] = 'parent';
			$this->values = array_unique($this->values);
			
			//Loop through array and add "value" statements to query
			$query_select = "";
			foreach($this->values as $key)
			{
				$query_select .= $key . ', ';
			}
			
			//Loop through array and add "where" statements to query
			foreach($this->where as $key => $value)
			{
				$query_where .= $key . ' = ' . (gettype($value) == 'string' ? ('"' . $value . '"') : $value) . ' ' . $this->separator . ' ';
			}
			
			//Merge and run query
			$query = 'SELECT ' . substr($query_select, 0, -2) . ' FROM ' . $this->table . ($this->where ? (' WHERE ' . substr($query_where, 0, (0 - strlen($this->separator) - 2))) : '') . ($this->order ? (' ORDER BY ' . $this->order) : '') . ($this->extra ? (' ' . $this->extra) : '');
			
			$result = mysql_query($query) or die(mysql_error());
			
			//Loop through result and add rows to array
			while($data = mysql_fetch_assoc($result))
			{
				$this->array[] = array_map('htmlspecialchars',$data);
			}
			
			//Quit function
			return true;
		}
		
		
		
		/** Organize **/
		function organize()
		{
			if(!is_array($this->array)){
				return FALSE;
			}
			//Loop through array
			foreach($this->array as $data)
			{
				//Organize a parent-child array and set 0 as depth for every node
				$this->organized_array[$data['parent']][$data['id']] = $data;
				$this->organized_depth[$data['id']] = 0;
			}
			
			//Start building a tree
			$this->build_tree($this->start);
		}
		
		
		
		/** Build tree **/
		function build_tree($parent = 0)
		{
			if(!$this->organized_array[$parent]){ return FALSE; }
			//Loop through parent-child organized array
			foreach($this->organized_array[$parent] as $id => $value)
			{
				//Count up the depth and merge it together with the other values to an array
				$this->organized_depth[$id] = $this->organized_depth[$parent] + 1;
				$this->tree[] = array_merge($value, array('depth' => $this->organized_depth[$id] - 1));
				
				//If the current node has got children, start looping through them
				if(isset($this->organized_array[$id]) && is_array($this->organized_array[$id])) $this->build_tree($id);
			}
		}
		
		
		
		/** Reset **/
		function reset()
		{
			unset($this->table);
			unset($this->values);
			unset($this->where);
			unset($this->separator);
			unset($this->order);
			unset($this->extra);
			unset($this->start);
			unset($this->array);
			unset($this->organized_array);
			unset($this->organized_depth);
			unset($this->tree);
			unset($this->insert_id);
			
			$this->table = '';
			$this->values = array();
			$this->where = array();
			$this->separator = 'AND';
			$this->order = "";
			$this->extra = '';
			$this->start = 0;
			$this->array = array();
			$this->organized_array = array();
			$this->organized_depth = array();
			$this->tree = array();
			$this->insert_id = 0;
		}
	}
?>