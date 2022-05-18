namespace $.$$ {

	export class $hyoo_js_eval extends $.$hyoo_js_eval {
		
		@ $mol_mem
		code( next?: string ) {
			return this.$.$mol_state_arg.value( 'code', next ) ?? ''
		}
		
		@ $mol_mem
		run( next?: boolean ) {
			return this.$.$mol_state_arg.value( 'run', next?.valueOf && String( next ) ) !== 'false'
		}
		
		@ $mol_mem
		perf() {
			const sources = encodeURIComponent(JSON.stringify([ this.code() ]))
			return `https://perf.js.hyoo.ru/#!sources=${sources}`
		}
		
		@ $mol_mem
		pages() {
			return [
				this.Menu_page(),
				this.Code_page(),
				... this.run() ? [ this.Result_page() ] : [],
			]
		}
		
		@ $mol_mem
		bookmark_list( next?: string[] ) {
			return this.$.$mol_state_local.value( 'snippets', next ) ?? super.bookmark_list()
		}
		
		@ $mol_mem
		bookmark( next?: boolean ) {
			const prev = this.bookmark_list()
			const code = this.code()
			if( next === undefined ) {
				return prev.includes( code )
			} else {
				const list = prev.filter( str => str !== code )
				if( next ) list.unshift( code )
				this.bookmark_list( list )
				return next
			}
		}
		
		@ $mol_mem
		menu() {
			return this.bookmark_list().map( (_, index )=> this.Menu_link( index ) )
		}
		
		menu_link_code( index: number ) {
			return this.bookmark_list()[ index ]
		}
		
		@ $mol_mem_key
		menu_link_title( index: number ) {
			return this.bookmark_list()[ index ]
				.replace( /\n[\s\S]*/, '' )
				.replace( /^\/\/ +/, '' )
		}
		
		@ $mol_mem
		code_enhanced() {
			
			let code = this.code()
			
			code = code.replaceAll(
				/^(\s*)(?:const|var|let) +(\w+)/mig,
				( found, indent, name )=> `${indent}this.spy( ()=>[ "${name} =", ${name} ] )\n${found}`
			)
			
			return code
		}
		
		@ $mol_mem
		execute() {
			
			const console = new Proxy( this.$.console, {
				get: ( target, field )=> {
					
					if( typeof target[ field ] !== 'function' ) return target[ field ]
					
					return ( ... args: any[] )=> {
						this.spy( ()=> [ `${String(field)}:`, ... args ] )
						return target[ field ]( ... args )
					}
					
				}
			} )
			
			return [ '=', $mol_try( ()=> eval( this.code_enhanced() ) ) ]
			
		}
		
		spy( args: ()=> any[] ) {
			Promise.resolve().then( ()=> {
				this.result([ ... this.result(), args() ])
			} )
		}

		@ $mol_mem
		result( next?: any[] ) {
			
			this.code()
			if( next ) return next
			
			return [ this.execute() ]
			
		}
		
		@ $mol_mem
		logs() {
			return this.result().map( (_,index)=> this.Log( index ) )
		}
		
		@ $mol_mem_key
		log( index: number ) {
			return this.result()[ index ]
		}

	}
	
	export class $hyoo_js_eval_log extends $.$hyoo_js_eval_log {
		
		@ $mol_mem
		sub() {
			return [
				this.Prefix(),
				... this.values().slice(1).map( (_,index)=> this.Dump( index + 1 ) )
			]
		}
		
		prefix() {
			return this.values()[0]
		}
		
		@ $mol_mem_key
		dump_value( index: number ) {
			return this.values()[ index ]
		}
		
	}
	
	export class $hyoo_js_eval_pair extends $.$hyoo_js_eval_pair {
		
		@ $mol_mem
		sub() {
			return this.suffix()
				? [ this.Key(), this.Suffix(), this.Value() ]
				: [ this.Value() ]
		}
		
	}
		
	export class $hyoo_js_eval_dump extends $.$hyoo_js_eval_dump {
		
		@ $mol_mem
		sub() {
			const value = this.value()
			if( !value ) return [ this.Simple() ]
			if( typeof value === 'object' ) return [ this.Expand() ]
			if( typeof value === 'function' ) return [ this.Expand() ]
			return [ this.Simple() ]
		}
		
		@ $mol_mem
		simple() {
			const value = this.value()
			return value ? String( value ) : JSON.stringify( value ) ?? 'undefined'
		}
		
		@ $mol_mem
		expand_title() {
			
			const value = this.value()
			
			if( typeof value === 'function' ) {
				const name = Reflect.getOwnPropertyDescriptor( value, 'name' )?.value
				const source = Function.prototype.toString.call( value )
				const args = source.replace( /\)[\s\S]*$/g, ')' ).replace( /^[\s\S]*\(/g, '(' )
				if( name ) return name + args + '{}'
			}
			
			if( value instanceof RegExp ) return String( value )
			if( value instanceof Date ) return value.toISOString()
			
			return Reflect.getOwnPropertyDescriptor( value, Symbol.toStringTag )?.value
				?? Reflect.getPrototypeOf( value )?.constructor.name
				?? 'Object'
		}
		
		@ $mol_mem
		pairs_data() {
			
			let value = this.value()
			
			const self = [] as any[][]
			for( const key of Reflect.ownKeys( value ) ) {
				const descr = Reflect.getOwnPropertyDescriptor( value, key )!
				if( 'value' in descr ) self.push([ key, '∶', descr.value ])
				if( 'get' in descr ) self.push([ 'get ' + String( key ), '∶', descr.get ])
				if( 'set' in descr ) self.push([ 'set ' + String( key ), '∶', descr.set ])
			}
			
			const map = value instanceof Map
				? [ ... value ].map( ([ key, val ])=> [ key, '🡒', val ] )
				: []
			
			const set = value instanceof Set
				? [ ... value ].map( val => [ null, '', val ] )
				: []
				
			const proto = Reflect.getPrototypeOf( value )
			
			return [
				... self,
				... map,
				... set,
				[ '[[prototype]]', ':', proto ]
			]
			
		}
		
		@ $mol_mem
		expand_content() {
			return this.pairs_data().map( (_,index)=> this.Pair( index ) )
		}
		
		pair_key( index: number ) {
			return this.pairs_data()[ index ][0]
		}

		pair_suffix( index: number ) {
			return this.pairs_data()[ index ][1]
		}

		pair_value( index: number ) {
			return this.pairs_data()[ index ][2]
		}

	}
	
}
