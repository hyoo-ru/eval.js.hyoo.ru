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
						this.spy( ()=> [ `console.${String(field)}:`, ... args ] )
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
			return this.values().map( (_,index)=> this.Dump( index ) )
		}
		
		@ $mol_mem_key
		dump_value( index: number ) {
			return this.values()[ index ]
		}
		
	}
	
	export class $hyoo_js_eval_dump extends $.$hyoo_js_eval_dump {
		
		@ $mol_mem
		sub() {
			
			const value = this.value()
			
			const prefix = this.key() === null ? [] : [ this.Key() ]
			
			if( value && ( typeof value === 'object' ) ) {
				return [ ...prefix, this.Expand() ]
			}
			
			return [ ... prefix, this.Simple() ]
		}
		
		@ $mol_mem
		simple() {
			return String( this.value() ) + this.suffix()
		}
		
		@ $mol_mem
		expand_title() {
			
			const value = this.value()
			
			return Reflect.getOwnPropertyDescriptor( value, Symbol.toStringTag )?.value
				?? Reflect.getPrototypeOf( value )!.constructor.name
			
		}
		
		@ $mol_mem
		inner_keys() {
			let value = this.value()
			return Reflect.ownKeys( value )
		}
		
		@ $mol_mem
		expand_content() {
			return this.inner_keys().map( (_,index)=> this.Inner( index ) )
		}
		
		@ $mol_mem_key
		inner_key( index: number ) {
			return this.inner_keys()[ index ]
		}

		@ $mol_mem_key
		inner_value( index: number ) {
			const key = this.inner_key( index )
			return Reflect.getOwnPropertyDescriptor( this.value(), key )?.value
		}

	}
	
}
